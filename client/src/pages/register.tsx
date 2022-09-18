import { Box, Button, FormControl } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
   MeDocument,
   MeQuery,
   RegisterInput,
   useRegisterMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
const Register = () => {
   const router = useRouter();
   const initialValues = {
      username: "",
      password: "",
      email: "",
   };

   const [registerUser, { loading: _registerUserLoading, data, error }] =
      useRegisterMutation();

   const onRegisterSubmit = async (
      values: RegisterInput,
      { setErrors }: FormikHelpers<RegisterInput>
   ) => {
      const response = await registerUser({
         variables: {
            registerInput: values,
         },
         update: (cache, { data }) => {
            console.log("DATA LOGIN", data);
            if (data?.register.success) {
               cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: { me: data.register.user },
               });
            }
         },
      });
      if (response.data?.register.errors) {
         setErrors(mapFieldErrors(response.data.register.errors));
      } else if (response.data?.register.user) {
         // register successfully
         router.push("/");
      }
   };
   return (
      <Wrapper>
         {error && <p>Failed to register</p>}
         {data && data.register.success && (
            <p>Registered successfully {JSON.stringify(data)}</p>
         )}
         <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
            {({ isSubmitting }) => (
               <Form>
                  <FormControl>
                     <InputField
                        name="username"
                        placeholder="Username"
                        label="Username"
                        type="text"
                     />
                     <Box mt={4}>
                        <InputField
                           name="email"
                           placeholder="Email"
                           label="Email"
                           type="text"
                        />
                     </Box>
                     <Box mt={4}>
                        <InputField
                           name="password"
                           placeholder="Password"
                           label="Password"
                           type="password"
                        />
                     </Box>

                     <Button
                        type="submit"
                        colorScheme="teal"
                        mt={4}
                        isLoading={isSubmitting}
                     >
                        Register
                     </Button>
                  </FormControl>
               </Form>
            )}
         </Formik>
      </Wrapper>
   );
};

export default Register;
