import React, { useState } from 'react';
import { measurementService } from '../services/api';
import '../styles/Operations.css';

const UNITS = {
  LengthUnit: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit: ['KILOGRAMS', 'GRAMS', 'POUNDS'],
  VolumeUnit: ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT'],
};

export const Compare = () => {
  const [thisQuantity, setThisQuantity] = useState({
    value: '',
    unit: 'FEET',
    measurementType: 'LengthUnit',
  });
  const [thatQuantity, setThatQuantity] = useState({
    value: '',
    unit: 'FEET',
    measurementType: 'LengthUnit',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleThisChange = (field, value) => {
    setThisQuantity({ ...thisQuantity, [field]: value });
  };

  const handleThatChange = (field, value) => {
    setThatQuantity({ ...thatQuantity, [field]: value });
  };

  const handleCompare = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await measurementService.compare(thisQuantity, thatQuantity);
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operation-card">
      <h3>Compare Quantities</h3>
      <div className="operation-form">
        <div className="quantity-inputs">
          <div className="quantity-group">
            <label>First Quantity:</label>
            <div className="input-row">
              <input
                type="number"
                placeholder="Value"
                value={thisQuantity.value}
                onChange={(e) => handleThisChange('value', e.target.value)}
              />
              <select
                value={thisQuantity.measurementType}
                onChange={(e) => {
                  const type = e.target.value;
                  handleThisChange('measurementType', type);
                  handleThisChange('unit', UNITS[type][0]);
                }}
              >
                {Object.keys(UNITS).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={thisQuantity.unit}
                onChange={(e) => handleThisChange('unit', e.target.value)}
              >
                {UNITS[thisQuantity.measurementType].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="quantity-group">
            <label>Second Quantity:</label>
            <div className="input-row">
              <input
                type="number"
                placeholder="Value"
                value={thatQuantity.value}
                onChange={(e) => handleThatChange('value', e.target.value)}
              />
              <select
                value={thatQuantity.measurementType}
                onChange={(e) => {
                  const type = e.target.value;
                  handleThatChange('measurementType', type);
                  handleThatChange('unit', UNITS[type][0]);
                }}
              >
                {Object.keys(UNITS).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={thatQuantity.unit}
                onChange={(e) => handleThatChange('unit', e.target.value)}
              >
                {UNITS[thatQuantity.measurementType].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>

        {result !== null && (
          <div className="result-box">
            <p className="result">{result ? 'Equal' : 'Not Equal'}</p>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};
