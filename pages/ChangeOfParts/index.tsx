import React from 'react'
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components'
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import axios from 'axios';

const ChangeOfPartsPage = () => {
    return (
        <ModuleMain>
            <ModuleHeader header="Change of Parts"></ModuleHeader>
            <ModuleContent>
                
            </ModuleContent>
        </ModuleMain>
    );
};

export default ChangeOfPartsPage;

export const getServerSideProps = (context: GetServerSidePropsContext) => {
    
};