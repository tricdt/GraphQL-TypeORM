import React from "react";
import { useField } from "formik";
import {
   FormControl,
   FormErrorMessage,
   FormLabel,
   Input,
} from "@chakra-ui/react";
interface InputFieldProps {
   name: string;
   label: string;
   placeholder: string;
   type: string;
}

const InputField = (props: InputFieldProps) => {
   const [field, { error }] = useField(props);
   return (
      <FormControl>
         <FormLabel htmlFor={field.name}>{props.name}</FormLabel>
         <Input {...field} id={field.name} {...props} />
         {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
   );
};

export default InputField;
