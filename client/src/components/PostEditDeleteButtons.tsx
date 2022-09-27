import { Box, IconButton } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import NextLink from "next/link";

interface PostEditDeleteButtonsProps {
   postId: string;
}
const PostEditDeleteButtons = ({ postId }: PostEditDeleteButtonsProps) => {
   return (
      <Box>
         <NextLink href={`/post/edit/${postId}`}>
            <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
         </NextLink>
         <IconButton
            icon={<DeleteIcon />}
            aria-label="delete"
            colorScheme="red"
         />
      </Box>
   );
};

export default PostEditDeleteButtons;
