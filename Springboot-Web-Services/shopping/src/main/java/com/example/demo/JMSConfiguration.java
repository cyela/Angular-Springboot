package com.example.demo;

import javax.jms.ConnectionFactory;

import org.springframework.boot.autoconfigure.jms.DefaultJmsListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.config.JmsListenerContainerFactory;
import org.springframework.jms.support.converter.MappingJackson2MessageConverter;
import org.springframework.jms.support.converter.MessageConverter;
import org.springframework.jms.support.converter.MessageType;

@Configuration
public class JMSConfiguration {

	@Bean
	public JmsListenerContainerFactory<?> jmsFactory(ConnectionFactory connectionFactory,
			DefaultJmsListenerContainerFactoryConfigurer configurer) {

		DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
		configurer.configure(factory, connectionFactory);

		return factory;
	}

	@Bean
	public MessageConverter jacksonJmsMessageConverter() {
		
		MappingJackson2MessageConverter convert = new MappingJackson2MessageConverter();
		convert.setTargetType(MessageType.TEXT);
		convert.setTypeIdPropertyName("_type");
		return convert;

	}

}
