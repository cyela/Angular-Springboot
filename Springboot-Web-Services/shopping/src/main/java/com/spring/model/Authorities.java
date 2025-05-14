package com.spring.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Authorities implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6005072159059903199L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "AUTHORITY_ID")
	private int authorityId;
	private String username;
	private String authority;

	@ManyToOne
	@JoinColumn(name = "username", referencedColumnName = "username", insertable = false, updatable = false)
	private User user;

	public int getAuthorityId() {
		return authorityId;
	}

	public void setAuthorityId(int authorityId) {
		this.authorityId = authorityId;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getAuthority() {
		return authority;
	}

	public void setAuthority(String authority) {
		this.authority = authority;
	}

	@Override
	public String toString() {
		return "Authorities [authorityId=" + authorityId + ", username=" + username + ", authority=" + authority + "]";
	}

}
