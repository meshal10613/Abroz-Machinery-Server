export interface LoginInput {
	email: string;
	password: string;
}

export interface LoginResult {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
}