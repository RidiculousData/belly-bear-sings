const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, doc, setDoc, addDoc, getDocs, query, where } = require('firebase/firestore');
const { getAuth, connectAuthEmulator, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { sampleUsers, sampleSongs } = require('./mock-data/index.cjs');

// Firebase config for emulator
const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
connectFirestoreEmulator(db, 'localhost', 8080);
connectAuthEmulator(auth, 'http://localhost:9099');

async function seedData() {
  console.log('🌱 Seeding sample data...');
  
  try {
    // Create sample users as defined in the login page
    console.log('👤 Creating sample users...');
    
    const createdUsers = [];
    
    for (const user of sampleUsers) {
      console.log(`   Creating user: ${user.displayName}`);
      
      let userCredential;
      let userId;
      
      try {
        // Try to create the user
        userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        userId = userCredential.user.uid;
        console.log(`   ✅ Created new user: ${user.displayName}`);
        
        // Create user document
        await setDoc(doc(db, 'users', userId), {
          userId: userId,
          displayName: user.displayName,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: new Date(),
        });
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ⚠️  User already exists: ${user.displayName}, signing in...`);
          // User already exists, sign in instead
          userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
          userId = userCredential.user.uid;
          console.log(`   ✅ Signed in existing user: ${user.displayName}`);
        } else {
          throw error;
        }
      }
      
      createdUsers.push({ ...user, userId });
    }
    
    // Use Alice as the default host for the sample party
    const hostUser = createdUsers[0];  // Alice Johnson
    const hostId = hostUser.userId;
    
    // Check if sample party already exists
    console.log('🎉 Creating sample party...');
    const existingPartyQuery = query(collection(db, 'parties'), where('hostId', '==', hostId), where('name', '==', 'Sample Karaoke Party'));
    const existingPartySnapshot = await getDocs(existingPartyQuery);
    
    let partyId;
    if (!existingPartySnapshot.empty) {
      // Use existing party
      partyId = existingPartySnapshot.docs[0].id;
      console.log(`   ⚠️  Sample party already exists: ${partyId}`);
    } else {
      // Create new party
      const partyRef = doc(collection(db, 'parties'));
      partyId = partyRef.id;
      
      await setDoc(partyRef, {
        partyId: partyId,
        hostId: hostId,
        name: 'Sample Karaoke Party',
        createdAt: new Date(),
        isActive: true,
      });
      console.log(`   ✅ Created new party: ${partyId}`);
    }
    
    // Add host as party guest (update if exists)
    await setDoc(doc(db, 'parties', partyId, 'partyGuests', hostId), {
      guestId: hostId,
      displayName: hostUser.displayName,
      boostsRemaining: 3,
      isAnonymous: false,
      isHost: true,
      joinedAt: new Date(),
    });
    
    // Add some of the other sample users as party guests
    console.log('👥 Adding sample users to party...');
    const partyGuests = [
      { user: createdUsers[2], boosts: 2 }, // Charlie Brown
      { user: createdUsers[3], boosts: 3 }, // Diana Prince
      { user: createdUsers[4], boosts: 1 }, // Evan Miller
    ];
    
    for (const guest of partyGuests) {
      await setDoc(doc(db, 'parties', partyId, 'partyGuests', guest.user.userId), {
        guestId: guest.user.userId,
        displayName: guest.user.displayName,
        boostsRemaining: guest.boosts,
        isAnonymous: false,
        isHost: false,
        joinedAt: new Date(),
      });
    }
    
    // Add sample songs to queue (using the sample songs from mock data)
    console.log('🎵 Adding sample songs to queue...');
    const queueSongs = sampleSongs.map((song, index) => ({
      ...song,
      requesterName: createdUsers[index % createdUsers.length].displayName,
      guestId: createdUsers[index % createdUsers.length].userId,
    }));
    
    for (let i = 0; i < queueSongs.length; i++) {
      const song = queueSongs[i];
      await addDoc(collection(db, 'parties', partyId, 'queueSongs'), {
        ...song,
        addedAt: new Date(Date.now() - (queueSongs.length - i) * 30000), // Stagger times
      });
    }
    
    console.log('✅ Sample data created successfully!');
    console.log('');
    console.log('🎉 PARTY DETAILS:');
    console.log(`   Party ID: ${partyId}`);
    console.log(`   Host: ${hostUser.displayName} (${hostUser.email})`);
    console.log('');
    console.log('👥 SAMPLE USERS CREATED:');
    for (const user of createdUsers) {
      console.log(`   ${user.role}: ${user.displayName} (${user.email})`);
      console.log(`     Password: ${user.password}`);
      console.log(`     ${user.description}`);
      console.log('');
    }
    console.log('🚀 NEXT STEPS:');
    console.log('   1. Open new terminal and run: pnpm dev');
    console.log('   2. Go to Public Website: http://localhost:3000');
    console.log('   3. Click "Login" and use any of the sample users above');
    console.log('   4. Or go to Singer PWA: http://localhost:3001');
    console.log(`   5. Enter party code: ${partyId}`);
    console.log('   6. Join as a guest and see the sample queue!');
    console.log('');
    console.log('📊 Check Firebase Emulator UI: http://localhost:4000');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seed function
seedData().then(() => {
  console.log('🌱 Seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}); 