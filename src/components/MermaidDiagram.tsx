import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, CircularProgress, Alert, Paper, Typography } from '@mui/material';

interface MermaidDiagramProps {
  diagram: string;
  title?: string;
  height?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ 
  diagram, 
  title,
  height = 'auto' 
}) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagramId] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
      classDiagram: {
        useMaxWidth: true,
      },
      sequence: {
        useMaxWidth: true,
      },
      stateDiagram: {
        useMaxWidth: true,
      },
    });
  }, []);

  useEffect(() => {
    if (!diagramRef.current || !diagram) return;

    setIsLoading(true);
    setError(null);

    const renderDiagram = async () => {
      try {
        // Clear previous content
        diagramRef.current!.innerHTML = '';

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, diagram);
        diagramRef.current!.innerHTML = svg;
        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [diagram, diagramId]);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3,
        minHeight: height === 'auto' ? undefined : height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          width: '100%',
          overflow: 'auto',
        }}
      >
        {isLoading && <CircularProgress />}
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box
          ref={diagramRef}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            '& svg': {
              maxWidth: '100%',
              height: 'auto',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

