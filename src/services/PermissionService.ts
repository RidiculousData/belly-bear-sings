import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, getEnvironment } from '@bellybearsings/firebase-config';
import { UserPermission, UserRole, Tenant } from '@bellybearsings/shared';

/**
 * Service for managing user permissions and environment access
 */
export class PermissionService {
  private static readonly PERMISSIONS_COLLECTION = 'userPermissions';

  /**
   * Get user permissions from Firestore
   */
  static async getUserPermissions(userId: string): Promise<UserPermission | null> {
    try {
      const docRef = doc(db, this.PERMISSIONS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId: docSnap.id,
          permissions: data.permissions.map((p: any) => {
            // Convert Firestore Timestamp to Date, or preserve Date object
            let grantedAt: Date;
            if (p.grantedAt && typeof p.grantedAt.toDate === 'function') {
              // Firestore Timestamp
              grantedAt = p.grantedAt.toDate();
            } else if (p.grantedAt instanceof Date) {
              // Already a Date object
              grantedAt = p.grantedAt;
            } else if (p.grantedAt) {
              // Try to convert if it's a timestamp object
              grantedAt = new Date(p.grantedAt);
            } else {
              // Fallback to current date
              grantedAt = new Date();
            }
            
            // Convert expiresAt similarly
            let expiresAt: Date | undefined;
            if (p.expiresAt) {
              if (typeof p.expiresAt.toDate === 'function') {
                expiresAt = p.expiresAt.toDate();
              } else if (p.expiresAt instanceof Date) {
                expiresAt = p.expiresAt;
              } else {
                expiresAt = new Date(p.expiresAt);
              }
            }
            
            return {
              tenant: p.tenant,
              role: p.role,
              grantedBy: p.grantedBy,
              grantedAt,
              expiresAt,
            };
          }),
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserPermission;
      }
      return null;
    } catch (error: any) {
      // Handle permission-denied errors gracefully (user not authenticated or permissions not set up)
      if (error?.code === 'permission-denied') {
        console.warn(`Permission denied when fetching user permissions for ${userId}. User may not be authenticated or permissions document doesn't exist yet.`);
        return null;
      }
      console.error('Error fetching user permissions:', error);
      return null;
    }
  }

  /**
   * Create or update user permissions
   */
  static async setUserPermissions(
    userId: string,
    permissions: UserPermission['permissions'],
    grantedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.PERMISSIONS_COLLECTION, userId);
      
      // Try to read existing document, but don't fail if it doesn't exist
      let existingDoc;
      try {
        existingDoc = await getDoc(docRef);
      } catch (readError: any) {
        // If read fails due to permissions, we'll try to create anyway
        if (readError?.code !== 'permission-denied') {
          throw readError;
        }
        console.warn('Could not read existing permissions document, will create new one');
        existingDoc = { exists: () => false } as any;
      }
      
      // Convert Date objects to Firestore Timestamps
      // For new permissions, use serverTimestamp. For existing permissions, preserve the original grantedAt
      const permissionData = {
        userId,
        permissions: permissions.map(p => {
          const permission: any = {
            tenant: p.tenant,
            role: p.role,
            grantedBy: p.grantedBy || grantedBy,
            // Preserve existing grantedAt if it's a Date, otherwise use serverTimestamp for new permissions
            // Note: We can't preserve serverTimestamp() values, so we'll use serverTimestamp for updates too
            // This is acceptable as it represents when the permission was last updated
            grantedAt: p.grantedAt instanceof Date ? Timestamp.fromDate(p.grantedAt) : serverTimestamp(),
            expiresAt: p.expiresAt ? (p.expiresAt instanceof Date ? Timestamp.fromDate(p.expiresAt) : null) : null,
          };
          return permission;
        }),
        isActive: true,
        updatedAt: serverTimestamp(),
      };

      if (existingDoc.exists()) {
        await updateDoc(docRef, permissionData);
        console.log(`Updated permissions for user ${userId}`);
      } else {
        await setDoc(docRef, {
          ...permissionData,
          createdAt: serverTimestamp(),
        });
        console.log(`Created permissions document for user ${userId}`);
      }
    } catch (error: any) {
      console.error('Error setting user permissions:', error);
      // Re-throw with more context
      throw new Error(`Failed to set user permissions for ${userId}: ${error?.message || error}`);
    }
  }

  /**
   * Check if user has access to a specific tenant
   */
  static async hasEnvironmentAccess(
    userId: string,
    tenant: Tenant
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    if (!permissions || !permissions.isActive) {
      return false;
    }

    const currentTenant = getEnvironment();
    
    return permissions.permissions.some(p => {
      // Check if permission is expired
      if (p.expiresAt && p.expiresAt < new Date()) {
        return false;
      }

      // Super admin has access to all tenants
      if (p.role === 'super_admin') {
        return true;
      }

      // Check if user has access to this tenant or all tenants
      if (p.tenant === 'all' || p.tenant === tenant || p.tenant === currentTenant) {
        return true;
      }

      return false;
    });
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    if (!permissions || !permissions.isActive) {
      return false;
    }

    const currentTenant = getEnvironment();

    return permissions.permissions.some(p => {
      // Check if permission is expired
      if (p.expiresAt && p.expiresAt < new Date()) {
        return false;
      }

      // Super admin has all roles
      if (p.role === 'super_admin') {
        return true;
      }

      // Check if user has the role in the current tenant
      if (
        p.role === role &&
        (p.tenant === 'all' || p.tenant === currentTenant)
      ) {
        return true;
      }

      return false;
    });
  }

  /**
   * Check if user has any of the specified roles
   */
  static async hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
    for (const role of roles) {
      if (await this.hasRole(userId, role)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get user's roles for the current environment
   */
  static async getUserRoles(userId: string): Promise<UserRole[]> {
    const permissions = await this.getUserPermissions(userId);
    if (!permissions || !permissions.isActive) {
      return ['guest']; // Default role
    }

    const currentTenant = getEnvironment();
    const roles: UserRole[] = [];

    permissions.permissions.forEach(p => {
      // Check if permission is expired
      if (p.expiresAt && p.expiresAt < new Date()) {
        return;
      }

      // Super admin
      if (p.role === 'super_admin') {
        roles.push('super_admin');
        return;
      }

      // Check if permission applies to current tenant
      if (p.tenant === 'all' || p.tenant === currentTenant) {
        if (!roles.includes(p.role)) {
          roles.push(p.role);
        }
      }
    });

    // Default to guest if no roles found
    return roles.length > 0 ? roles : ['guest'];
  }

  /**
   * Get user's primary role (highest privilege)
   */
  static async getPrimaryRole(userId: string): Promise<UserRole> {
    const roles = await this.getUserRoles(userId);
    
    // Role hierarchy (highest to lowest)
    const hierarchy: UserRole[] = [
      'super_admin',
      'admin',
      'developer',
      'tester',
      'host',
      'guest',
    ];

    for (const role of hierarchy) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return 'guest';
  }

  /**
   * Initialize default permissions for a new user
   */
  static async initializeDefaultPermissions(
    userId: string,
    grantedBy: string = 'system'
  ): Promise<void> {
    const currentTenant = getEnvironment();
    
    await this.setUserPermissions(userId, [
      {
        tenant: currentTenant,
        role: 'guest',
        grantedAt: new Date(),
        grantedBy,
      },
    ], grantedBy);
  }

  /**
   * Grant permission to a user
   */
  static async grantPermission(
    userId: string,
    tenant: Tenant | 'all',
    role: UserRole,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    const permissions = await this.getUserPermissions(userId);
    const currentPermissions = permissions?.permissions || [];

    // Check if permission already exists
    const existingIndex = currentPermissions.findIndex(
      p => p.tenant === tenant && p.role === role
    );

    if (existingIndex >= 0) {
      // Update existing permission - preserve the original grantedAt
      const existingPermission = currentPermissions[existingIndex];
      currentPermissions[existingIndex] = {
        ...existingPermission,
        grantedBy,
        expiresAt,
        // Keep the original grantedAt, don't overwrite it
      };
    } else {
      // Add new permission
      currentPermissions.push({
        tenant,
        role,
        grantedAt: new Date(),
        grantedBy,
        expiresAt,
      });
    }

    await this.setUserPermissions(userId, currentPermissions, grantedBy);
  }

  /**
   * Revoke permission from a user
   */
  static async revokePermission(
    userId: string,
    tenant: Tenant | 'all',
    role: UserRole
  ): Promise<void> {
    const permissions = await this.getUserPermissions(userId);
    if (!permissions) {
      return;
    }

    const filteredPermissions = permissions.permissions.filter(
      p => !(p.tenant === tenant && p.role === role)
    );

    await this.setUserPermissions(
      userId,
      filteredPermissions,
      'system' // System revocation
    );
  }
}

