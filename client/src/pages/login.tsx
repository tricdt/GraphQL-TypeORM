import {
   Box,
   Button,
   Flex,
   FormControl,
   Spinner,
   useToast,
} from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
   LoginInput,
   MeDocument,
   MeQuery,
   RegisterInput,
   useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";
const Login = () => {
   const router = useRouter();
   const { data: authData, loading: authLoading } = useCheckAuth();
   const initialValues = {
      usernameOrEmail: "",
      password: "",
   };

   const [loginUser, { loading: _registerUserLoading, data, error }] =
      useLoginMutation();

   const toast = useToast();

   const onLoginSubmit = async (
      values: LoginInput,
      { setErrors }: FormikHelpers<LoginInput>
   ) => {
      const response = await loginUser({
         variables: {
            loginInput: values,
         },
         update: (cache, { data }) => {
            console.log("DATA LOGIN", data);
            if (data?.login.success) {
               // const meData = cache.readQuery<MeQuery>({
               //    query: MeDocument,
               // });
               // console.log("Me Data", meData);
               cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: { me: data.login.user },
               });
            }
         },
      });
      if (response.data?.login.errors) {
         setErrors(mapFieldErrors(response.data.login.errors));
      } else if (response.data?.login.user) {
         // login successfully
         toast({
            title: "Welcome",
            description: `${response.data.login.user.username}`,
            status: "success",
            duration: 3000,
            isClosable: true,
         });
         router.push("/");
      }
   };
   if (authLoading || (!authLoading && authData?.me))
      return (
         <Flex justifyContent="center" alignItems="center" minH="100vh">
            <Spinner />
         </Flex>
      );
   return (
      <Wrapper>
         {error && <p>Failed to register</p>}
         {data && data.login.success && (
            <p>Login successfully {JSON.stringify(data)}</p>
         )}
         <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
            {({ isSubmitting }) => (
               <Form>
                  <FormControl>
                     <InputField
                        name="usernameOrEmail"
                        placeholder="Username or Email"
                        label="Username or Email"
                        type="text"
                     />

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
                        Login
                     </Button>
                  </FormControl>
               </Form>
            )}
         </Formik>
      </Wrapper>
   );
};

export default Login;
