import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

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
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // console.log(JSON.stringify(post.data.content, null, 2))
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

          {post.data.content.map( content => {
            <div key={content.heading}>
              <strong>{content.heading}</strong>
              {content.body.map( body => {
                <p>{body.text}</p>
              })}
            </div>
          })}

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
  // console.log(posts)

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


  // const post = {
  //   uid: response.uid,
  //   first_publication_date: response.first_publication_date,
  //   data: {
  //     title: RichText.asText(response.data.title),
  //     subtitle: RichText.asText(response.data.subtitle),
  //     author: RichText.asText(response.data.author),
  //     banner: {
  //       url: response.data.banner,
  //     },
  //     content: response.data.content,
  //   },
  // };
    

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: RichText.asText(response.data.title),
      author: RichText.asText(response.data.author),
      banner: {
        url: response.data.banner,
      },
      content: response.data.content.map( content => {
        return {
          heading: RichText.asText(content.heading),
          body: content.body.map( body => {
            return {text: body.text}              
          }),
        }
      }),
    },
  };
      

  return{
    props: {
      post,
    }
  }
}