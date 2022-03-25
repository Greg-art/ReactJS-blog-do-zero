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

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: RichTextField;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return(
    <>
      <div className={styles.head}>
      <img src={post.data.banner.url} alt="" />
        <h1>{post.data.title}</h1>
        <div className={styles.extra}>
          <FiCalendar />
          <time>{post.first_publication_date}</time>
          <FiUser />
          <span>{post.data.author}</span>
          <FiClock />
          <span>tempo estimado</span>
        </div>  
        <div className={styles.content}>
          {post.data.content.map(content => (
            console.log(content.body[0]),
            <>
              <h2>{content.heading}</h2>
              <PrismicRichText field={content.body} />
            </>
          ))}
        </div>
      </div>
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

  return {
    paths: [
      { params: { slug: posts.results[0].uid}}           
    ],
    fallback: 'blocking'
  }
  // TODO
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID<any>('posts',String(slug), {})

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
    data: response.data,
  };
  

  return{
    props: {
      post,
    },
    revalidate: 60* 30
  }
}