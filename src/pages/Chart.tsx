import React from 'react';

import  TableBooks from '../components/Tables/TableBooks';

const Chart: React.FC = () => {
  return (
   

      <div className="grid grid-cols-15 gap-9 md:gap-6 2xl:gap-9">
      <TableBooks/>
      </div>
    
  );
};

export default Chart;
