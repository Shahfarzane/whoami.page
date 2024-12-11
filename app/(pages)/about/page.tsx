import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Link, Text, Box } from '@radix-ui/themes';
import React from 'react';

const AboutPage = () => {
  return (
    <div>
      <Heading
        as="h1"
        size="8"
        mb="2"
        style={{ scrollMarginTop: 'var(--space-9)' }}
      >
        About WhoAmI
      </Heading>
      <Box mt="2" mb="7">
        <Flex direction="column" gap="4" pt="4" pb="4">
          <Text size="4" color="gray" as="p">
            WhoAmI is an innovative online platform that empowers individuals to
            explore and share their unique identities. Inspired by the classic
            "whoami" command found in Linux and Mac operating systems, which
            displays the username of the current user, our platform takes this
            concept to a whole new level.
          </Text>
          <Text size="4" color="gray" as="p">
            At WhoAmI, we believe that every person has a story to tell and a
            distinct perspective to offer. Our mission is to provide a secure
            and inclusive space where users can delve deep into their own
            identities and connect with others who share similar experiences,
            passions, and values.
          </Text>
          <Text size="4" color="gray" as="p">
            With WhoAmI, you have the power to craft a comprehensive profile
            that showcases the many facets of who you are. From your personal
            background and life experiences to your hobbies, skills, and
            aspirations, you can paint a vivid picture of your authentic self.
            Our intuitive interface and customizable features allow you to
            express yourself in a way that feels true to you.
          </Text>
          <Text size="4" color="gray" as="p">
            But WhoAmI is more than just a platform for self-expression. It's a
            vibrant community where individuals can discover, connect, and
            engage with like-minded souls. Through our advanced search and
            recommendation algorithms, you can easily find and connect with
            others who share your interests, passions, or life experiences.
            Whether you're seeking mentorship, collaboration, or simply
            meaningful conversations, WhoAmI makes it easy to build genuine
            connections.
          </Text>
          <Text size="4" color="gray" as="p">
            We understand the importance of privacy and security in today's
            digital landscape. That's why we have implemented state-of-the-art
            encryption and data protection measures to ensure that your personal
            information remains safe and secure. You have full control over your
            privacy settings, allowing you to decide what information you want
            to share and with whom.
          </Text>
          <Text size="4" color="gray" as="p">
            At WhoAmI, we celebrate diversity, inclusivity, and the power of
            authentic self-expression. We believe that by empowering individuals
            to embrace and share their true selves, we can foster a more
            compassionate, understanding, and connected world.
          </Text>
          <Text size="4" color="gray" as="p">
            Join us on this exciting journey of self-discovery and connection.
            Sign up today and start exploring the incredible depths of who you
            are and the inspiring stories of others. Welcome to WhoAmI - where
            your unique identity takes center stage.
          </Text>
        </Flex>
        <Flex
          direction={{ initial: 'column', xs: 'row' }}
          gap={{ initial: '3', xs: '5' }}
          mt="5"
        >
          <Flex asChild display="inline-flex" align="center" gap="2">
            <Link size="3" target="_blank" href="mailto:info@whoami.page">
              Contact us
              <Box asChild style={{ color: 'var(--gray-9)' }}>
                <ArrowTopRightIcon />
              </Box>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
};

export default AboutPage;
