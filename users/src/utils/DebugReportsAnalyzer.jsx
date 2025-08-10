import React, { useState } from 'react';

export function DebugReportsAnalyzer({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Analyze the data structure
  const analyze = () => {
    const result = {
      type: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : null,
      keys: typeof data === 'object' && data !== null ? Object.keys(data) : null,
      sample: null,
      hasReportsArray: false,
      hasDataProperty: false,
      dataType: null,
      possibleReportsLocations: []
    };
    
    // Get a sample if it's an array
    if (Array.isArray(data) && data.length > 0) {
      result.sample = data[0];
    }
    
    // Check common API patterns
    if (data && typeof data === 'object') {
      result.hasReportsArray = Array.isArray(data.reports);
      result.hasDataProperty = data.data !== undefined;
      result.dataType = typeof data.data;
      
      // Check potential locations for reports
      if (Array.isArray(data.reports)) {
        result.possibleReportsLocations.push({
          path: 'reports',
          isArray: true,
          length: data.reports.length
        });
      }
      
      if (Array.isArray(data.data)) {
        result.possibleReportsLocations.push({
          path: 'data',
          isArray: true,
          length: data.data.length
        });
      }
      
      if (data.data && typeof data.data === 'object' && Array.isArray(data.data.reports)) {
        result.possibleReportsLocations.push({
          path: 'data.reports',
          isArray: true,
          length: data.data.reports.length
        });
      }
    }
    
    return result;
  };
  
  const analysis = analyze();
  
  if (!data) {
    return <div className="hidden">No data to analyze</div>;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white px-3 py-1 rounded-md text-xs"
      >
        {isOpen ? 'Hide Debug' : 'Debug Data'}
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-gray-900 text-gray-300 rounded-md shadow-lg max-w-md max-h-96 overflow-auto">
          <h4 className="font-bold mb-2">Data Analysis</h4>
          <ul className="text-xs space-y-1">
            <li>Type: <span className="text-green-400">{analysis.type}</span></li>
            <li>Is Array: <span className="text-green-400">{String(analysis.isArray)}</span></li>
            {analysis.length !== null && (
              <li>Array Length: <span className="text-green-400">{analysis.length}</span></li>
            )}
            {analysis.keys && (
              <li>Object Keys: <span className="text-green-400">{analysis.keys.join(', ')}</span></li>
            )}
            <li>Has 'reports' Array: <span className="text-green-400">{String(analysis.hasReportsArray)}</span></li>
            <li>Has 'data' Property: <span className="text-green-400">{String(analysis.hasDataProperty)}</span></li>
            <li>Data Property Type: <span className="text-green-400">{analysis.dataType}</span></li>
          </ul>
          
          {analysis.possibleReportsLocations.length > 0 && (
            <div className="mt-3">
              <h5 className="font-bold text-xs mb-1">Possible Reports Locations:</h5>
              <ul className="text-xs space-y-1">
                {analysis.possibleReportsLocations.map((loc, i) => (
                  <li key={i}>
                    Path: <span className="text-yellow-400">{loc.path}</span> - 
                    Array: <span className="text-green-400">{String(loc.isArray)}</span> - 
                    Length: <span className="text-green-400">{loc.length}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.sample && (
            <div className="mt-3">
              <h5 className="font-bold text-xs mb-1">Sample Item:</h5>
              <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify(analysis.sample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
