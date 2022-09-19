import Register from "./register";
import Navbar from "../components/Navbar";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
const Index = () => {
   const { data, loading } = usePostsQuery();

   return (
      <>
         <Navbar />
         {loading ? (
            "LOADING..."
         ) : (
            <ul>
               {data?.posts?.map((post) => (
                  <li>{post.title}</li>
               ))}
            </ul>
         )}
      </>
   );
};

export async function getStaticProps() {
   const apolloClient = initializeApollo();

   await apolloClient.query({
      query: PostsDocument,
   });

   return addApolloState(apolloClient, {
      props: {},
   });
}

export default Index;
