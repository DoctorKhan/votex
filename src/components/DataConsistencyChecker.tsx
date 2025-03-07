'use client';

import { useEffect } from 'react';
import { generateSamplePersonaData, checkDataConsistency } from '../utils/personaDataUtils';

interface DataConsistencyCheckerProps {
  generateSampleData?: boolean;
  debug?: boolean;
}

/**
 * Component that checks data consistency between persona activities,
 * proposals, and comments. It can optionally generate sample data.
 * It doesn't render anything visible - it's just for side effects.
 */
const DataConsistencyChecker: React.FC<DataConsistencyCheckerProps> = ({
  generateSampleData = false,
  debug = false
}) => {
  // Run consistency check and optionally generate sample data
  useEffect(() => {
    const runChecks = () => {
      try {
        // Check if there's any data already
        const hasProposals = localStorage.getItem('personaProposals') !== null;
        const hasActivities = localStorage.getItem('personaActivities') !== null;
        
        // Generate sample data if requested or if there's no data yet
        if (generateSampleData || (!hasProposals && hasActivities)) {
          if (debug) console.log('Generating sample persona data');
          generateSamplePersonaData();
        }
        
        // Run consistency check
        const results = checkDataConsistency();
        
        if (!results.consistent) {
          console.warn('Found data inconsistencies:', results.issues);
        } else if (debug) {
          console.log('Data consistency check passed');
        }
      } catch (e) {
        console.error('Error in data consistency check:', e);
      }
    };
    
    runChecks();
  }, [generateSampleData, debug]);

  // Don't render anything visible
  return null;
};

export default DataConsistencyChecker;