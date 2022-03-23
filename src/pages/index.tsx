import { GetStaticProps } from 'next';
import Head from 'next/Head';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
 

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  return(
    
    // console.log(JSON.stringify(postsPagination, null, 2)),
    // console.log(JSON.stringify(postsPagination.results, null, 2)),

    <>
      <Head>
        <title> BlogBleg | Home</title>
      </Head>


      <div className={styles.container}>
        <div className={styles.posts}>

          { postsPagination.results.map( post => (
            <div className={styles.post} key={post.uid}>
              <a href={`/post/${post.uid}`}>
                <h1>{post.data.title}</h1>
              </a>   
              <p>{post.data.subtitle}</p>
              <div className={styles.extra}>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
                <FiUser />
                <span>{post.data.author}</span>
              </div>            
            </div>
          ))}      

        </div>
      </div>

    </>
  )
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // busca por tipo 
  const postsResponse = await prismic.query<any>([
    Prismic.predicates.at('document.type','posts')
  ],{
    pageSize: 5
  });


  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map( post => {
      return {
        uid: post.uid,
        first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR',{
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        data: {
          title: RichText.asText(post.data.title),
          subtitle: RichText.asText(post.data.subtitle),
          author: RichText.asText(post.data.author),
        }
      }
    }),
  }
  // console.log(JSON.stringify(postsPagination.results[0].updatedAt, null, 2))


  return{
    props: {
      postsPagination,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}