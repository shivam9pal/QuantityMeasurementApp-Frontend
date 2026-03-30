import React, { useState } from 'react';
import { measurementService } from '../services/api';
import '../styles/Operations.css';

const UNITS = {
  LengthUnit: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit: ['KILOGRAMS', 'GRAMS', 'POUNDS'],
  VolumeUnit: ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT'],
};

export const Arithmetic = () => {
  const [operation, setOperation] = useState('ADD');
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
  const [targetUnit, setTargetUnit] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleThisChange = (field, value) => {
    setThisQuantity({ ...thisQuantity, [field]: value });
  };

  const handleThatChange = (field, value) => {
    setThatQuantity({ ...thatQuantity, [field]: value });
  };

  const handleMeasurementTypeChange = (field, type) => {
    if (field === 'this') {
      setThisQuantity({
        ...thisQuantity,
        measurementType: type,
        unit: UNITS[type][0],
      });
    } else {
      setThatQuantity({
        ...thatQuantity,
        measurementType: type,
        unit: UNITS[type][0],
      });
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let data;
      if (operation === 'ADD') {
        data = await measurementService.add(thisQuantity, thatQuantity, targetUnit);
      } else if (operation === 'SUBTRACT') {
        data = await measurementService.subtract(thisQuantity, thatQuantity, targetUnit);
      } else if (operation === 'DIVIDE') {
        data = await measurementService.divide(thisQuantity, thatQuantity);
      }
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || `${operation} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operation-card">
      <h3>Arithmetic Operations</h3>
      <div className="operation-form">
        <div className="operation-selector">
          <label>Operation:</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="ADD">Add</option>
            <option value="SUBTRACT">Subtract</option>
            <option value="DIVIDE">Divide</option>
          </select>
        </div>

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
                onChange={(e) => handleMeasurementTypeChange('this', e.target.value)}
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
                onChange={(e) => handleMeasurementTypeChange('that', e.target.value)}
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

          {(operation === 'ADD' || operation === 'SUBTRACT') && (
            <div className="quantity-group">
              <label>Result Unit (Optional):</label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
              >
                <option value="">Auto (Same as first)</option>
                {UNITS[thisQuantity.measurementType].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button onClick={handleExecute} disabled={loading}>
          {loading ? `${operation}ing...` : operation}
        </button>

        {result && (
          <div className="result-box">
            <p className="result">
              {typeof result === 'number'
                ? result
                : `${result.value} ${result.unit}`}
            </p>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};
