import React from 'react';
// @ts-ignore
import ReactBarcode from 'react-barcode';

interface BarcodeProps {
  value: string;
}

const BarcodeComponent: React.FC<BarcodeProps> = ({ value }) => {
  if (!value) return null;

  return (
    <div className="flex justify-center">
      <ReactBarcode 
        value={value} 
        options={{
          format: 'CODE128',
          displayValue: true,
          fontOptions: 'bold',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 2,
          fontSize: 14,
          height: 60,
          width: 2,
          margin: 10,
        }}
      />
    </div>
  );
};

export default BarcodeComponent;