import React, { useState, useEffect } from 'react';
import { measurementService } from '../services/api';
import '../styles/History.css';

export const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationFilter, setOperationFilter] = useState('ALL');

  const operations = ['ALL', 'COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE'];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, operationFilter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await measurementService.getHistory();
      setHistory(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    if (operationFilter === 'ALL') {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter((item) => item.operation === operationFilter));
    }
  };

  if (loading) return <div className="history-container"><p>Loading history...</p></div>;
  if (error) return <div className="history-container"><p className="error">{error}</p></div>;

  return (
    <div className="history-container">
      <h3>Measurement History</h3>

      <div className="history-filter">
        <label>Filter by Operation:</label>
        <select value={operationFilter} onChange={(e) => setOperationFilter(e.target.value)}>
          {operations.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="no-history">No measurements recorded yet</p>
      ) : (
        <div className="history-list">
          {filteredHistory.map((item, index) => (
            <div key={item.id || index} className="history-item">
              <div className="history-header">
                <span className="operation-badge">{item.operation}</span>
                <span className="history-id">#{item.id}</span>
              </div>

              <div className="history-content">
                {item.operation === 'COMPARE' && (
                  <>
                    <p>
                      <strong>Comparing:</strong> {item.thisValue} {item.thisUnit} vs{' '}
                      {item.thatValue} {item.thatUnit}
                    </p>
                    <p>
                      <strong>Result:</strong> {item.resultString}
                    </p>
                  </>
                )}

                {item.operation === 'CONVERT' && (
                  <>
                    <p>
                      <strong>Converting:</strong> {item.thisValue} {item.thisUnit}
                    </p>
                    <p>
                      <strong>Result:</strong> {item.resultString}
                    </p>
                  </>
                )}

                {item.operation === 'ADD' && (
                  <>
                    <p>
                      <strong>Adding:</strong> {item.thisValue} {item.thisUnit} +{' '}
                      {item.thatValue} {item.thatUnit}
                    </p>
                    <p>
                      <strong>Result:</strong> {item.resultString}
                    </p>
                  </>
                )}

                {item.operation === 'SUBTRACT' && (
                  <>
                    <p>
                      <strong>Subtracting:</strong> {item.thisValue} {item.thisUnit} -{' '}
                      {item.thatValue} {item.thatUnit}
                    </p>
                    <p>
                      <strong>Result:</strong> {item.resultString}
                    </p>
                  </>
                )}

                {item.operation === 'DIVIDE' && (
                  <>
                    <p>
                      <strong>Dividing:</strong> {item.thisValue} {item.thisUnit} /{' '}
                      {item.thatValue} {item.thatUnit}
                    </p>
                    <p>
                      <strong>Result:</strong> {item.resultString}
                    </p>
                  </>
                )}
              </div>

              {item.isError && <div className="error-badge">Error</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
