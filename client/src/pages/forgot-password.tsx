import { Box, Button, Flex, Link, Spinner } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import NextLink from "next/link";
import {
   ForgotPasswordInput,
   useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const ForgotPassword = () => {
   const { data: authData, loading: authLoading } = useCheckAuth();
   const initialValues = { email: "" };
   const [forgotPassword, { data, loading }] = useForgotPasswordMutation();
   const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
      await forgotPassword({ variables: { forgotPasswordInput: values } });
   };
   if (authLoading || (!authLoading && authData?.me)) {
      return (
         <Flex justifyContent="center" alignItems="center" minH="100vh">
            <Spinner />
         </Flex>
      );
   } else
      return (
         <Wrapper size="small">
            <Formik
               initialValues={initialValues}
               onSubmit={onForgotPasswordSubmit}
            >
               {({ isSubmitting }) =>
                  !loading && data ? (
                     <Box>Please check your inbox</Box>
                  ) : (
                     <Form>
                        <InputField
                           name="email"
                           placeholder="Email"
                           label="Email"
                           type="email"
                        />

                        <Flex mt={2}>
                           <NextLink href="/login">
                              <Link ml="auto">Back to Login</Link>
                           </NextLink>
                        </Flex>

                        <Button
                           type="submit"
                           colorScheme="teal"
                           mt={4}
                           isLoading={isSubmitting}
                        >
                           Send Reset Password Email
                        </Button>
                     </Form>
                  )
               }
            </Formik>
         </Wrapper>
      );
};

export default ForgotPassword;
