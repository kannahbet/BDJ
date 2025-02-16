import React from 'react';
import TableThree from '../../components/Tables/lisUsers';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const SignUp: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Sign Up" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
        
        <TableThree/>
          
        </div>
      </div>
    </>
  );
};

export default SignUp;
