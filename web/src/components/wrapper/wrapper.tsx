import React, { memo } from 'react';
import { Box } from '@chakra-ui/layout';

type WrapperProps = {
    children?: React.ReactNode;
};

const Wrapper = memo<WrapperProps>(({ children }) => {
    return (
        <Box mt="8" mx="auto" maxW="800px" w="100%">
            {children}
        </Box>
    );
});

export default Wrapper;
