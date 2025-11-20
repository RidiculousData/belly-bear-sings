import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Navigation } from '../components/Navigation';
import { MermaidDiagram } from '../components/MermaidDiagram';

// Import Mermaid diagrams as text
// Note: In production, these would be loaded from the docs folder
// For now, we'll embed them or load via fetch

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`diagram-tabpanel-${index}`}
      aria-labelledby={`diagram-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DIAGRAM_FILES = [
  { id: 'class', label: 'Class Diagram', path: '/docs/uml-class-diagram.mermaid' },
  { id: 'relationships', label: 'Relationships', path: '/docs/uml-relationships.mermaid' },
  { id: 'package', label: 'Package Diagram', path: '/docs/uml-package-diagram.mermaid' },
  { id: 'sequence', label: 'Sequence Diagrams', path: '/docs/uml-sequence-diagrams.mermaid' },
  { id: 'er', label: 'ER Diagram', path: '/docs/logical-data-model.mermaid' },
  { id: 'aggregates', label: 'Aggregate Boundaries', path: '/docs/aggregate-boundaries.mermaid' },
  { id: 'states', label: 'State Machines', path: '/docs/state-machines.mermaid' },
];

export const DomainModelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [diagrams, setDiagrams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiagrams = async () => {
      try {
        setLoading(true);
        const loaded: Record<string, string> = {};

        // Load all diagrams
        for (const diagram of DIAGRAM_FILES) {
          try {
            const response = await fetch(diagram.path);
            if (response.ok) {
              loaded[diagram.id] = await response.text();
            } else {
              console.warn(`Failed to load ${diagram.path}: ${response.statusText}`);
            }
          } catch (err) {
            console.error(`Error loading ${diagram.path}:`, err);
          }
        }

        setDiagrams(loaded);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load diagrams');
      } finally {
        setLoading(false);
      }
    };

    loadDiagrams();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Domain Model
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Visual representation of the application's domain model, including UML class diagrams, 
          relationships, sequence diagrams, and state machines.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {DIAGRAM_FILES.map((diagram, index) => (
              <Tab key={diagram.id} label={diagram.label} />
            ))}
          </Tabs>

          {DIAGRAM_FILES.map((diagram, index) => (
            <TabPanel key={diagram.id} value={activeTab} index={index}>
              {diagrams[diagram.id] ? (
                (() => {
                  // Handle sequence diagrams which may contain multiple diagrams separated by ---
                  const diagramContent = diagrams[diagram.id];
                  const diagramParts = diagramContent.split(/^---$/m).filter(part => part.trim());
                  
                  if (diagramParts.length > 1) {
                    // Multiple diagrams - render each separately
                    return diagramParts.map((part, partIndex) => (
                      <MermaidDiagram 
                        key={partIndex}
                        diagram={part.trim()} 
                        title={partIndex === 0 ? diagram.label : `${diagram.label} (${partIndex + 1})`}
                      />
                    ));
                  } else {
                    // Single diagram
                    return (
                      <MermaidDiagram 
                        diagram={diagramContent} 
                        title={diagram.label}
                      />
                    );
                  }
                })()
              ) : (
                <Alert severity="warning">
                  Diagram not available. Make sure the file exists at {diagram.path}
                </Alert>
              )}
            </TabPanel>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            About This Page
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This page displays the domain model diagrams for the Belly Bear Sings application. 
            These diagrams are automatically generated from the Mermaid files in the <code>docs/</code> directory.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> This page will eventually be protected behind access control 
            so only developers can view it.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

