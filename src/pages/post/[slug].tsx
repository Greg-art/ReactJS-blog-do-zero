import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { PrismicRichText } from '@prismicio/react';
import { RichTextField } from '@prismicio/types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: RichTextField;
      body: RichTextField;
    }[];
    estimated_time: number;
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return(
    <>
    <Head> <title>Home | BlogBleg</title> </Head>
    <body>


      {post.data.banner.url && (
        <img className={styles.banner} src={post.data.banner.url} alt="" />
      )}

      <div className={styles.post}>
        <div className={styles.head}>          
          
          <h1>{post.data.title}</h1>

          <div className={styles.info}>
            <FiCalendar />
            <span><time>{post?.first_publication_date}</time></span>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <span>{post.data.estimated_time}m</span>
          </div>  
          
        </div>

        <div className={styles.content}>
          {post.data.content.map(content => {
            return(
              <div key={RichText.asText(content.heading)}>
                <PrismicRichText field={content.heading} />
                <PrismicRichText field={content.body} />
              </div>
            )
          })}
        </div>
      </div>
    </body>
    </>
  )
}


export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query<any>([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 10
  });

  const paths = posts.results.map( result => {
    return{  
      params: { slug: result.uid } }   
    }
  ) 

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID<any>('posts',String(slug), {})

  // RichText.asText(response.data.content).split(' ').length()


  
  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
      ),
    // data: response.data,
    data: {
      title: RichText.asText(response.data.title),
      banner: response.data.banner,
      author: RichText.asText(response.data.author),
      content: response.data.content,
      estimated_time: response.data.content.reduce((minLecture, content) => {
        const size = RichText.asText(content.body).split(/[,.\s]/).length;
  
        /* eslint no-param-reassign: ["off"] */
        minLecture = Math.ceil(size / 200);
        return minLecture;
      }, 0),
    },
  };

  return{
    props: {
      post,
    },
    revalidate: 60* 30
  }
}