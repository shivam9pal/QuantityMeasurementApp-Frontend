import React, { useState } from 'react';
import { measurementService } from '../services/api';
import '../styles/Operations.css';

const UNITS = {
  LengthUnit: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit: ['KILOGRAMS', 'GRAMS', 'POUNDS'],
  VolumeUnit: ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT'],
};

export const Convert = () => {
  const [quantity, setQuantity] = useState({
    value: '',
    unit: 'FEET',
    measurementType: 'LengthUnit',
  });
  const [targetUnit, setTargetUnit] = useState('INCHES');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (field, value) => {
    setQuantity({ ...quantity, [field]: value });
  };

  const handleMeasurementTypeChange = (e) => {
    const type = e.target.value;
    setQuantity({
      ...quantity,
      measurementType: type,
      unit: UNITS[type][0],
    });
    setTargetUnit(UNITS[type][1] || UNITS[type][0]);
  };

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await measurementService.convert(quantity, targetUnit);
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operation-card">
      <h3>Convert Quantity</h3>
      <div className="operation-form">
        <div className="quantity-inputs">
          <div className="quantity-group">
            <label>From:</label>
            <div className="input-row">
              <input
                type="number"
                placeholder="Value"
                value={quantity.value}
                onChange={(e) => handleQuantityChange('value', e.target.value)}
              />
              <select
                value={quantity.measurementType}
                onChange={handleMeasurementTypeChange}
              >
                {Object.keys(UNITS).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={quantity.unit}
                onChange={(e) => handleQuantityChange('unit', e.target.value)}
              >
                {UNITS[quantity.measurementType].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="quantity-group">
            <label>To:</label>
            <select
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
            >
              {UNITS[quantity.measurementType].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleConvert} disabled={loading}>
          {loading ? 'Converting...' : 'Convert'}
        </button>

        {result && (
          <div className="result-box">
            <p className="result">
              {result.value} {result.unit}
            </p>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};
