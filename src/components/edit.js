import React from "react";

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id			: props.match.params.id,
			error		: null,
			isLoaded	: false,
			entry		: []
		};
	}

	getPost() {
		fetch("http://dev.api.carlosvazquez.org/blog/api/admin/getPost/" + this.state.id)
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						isLoaded	: true,
						entry		: result.post[0]
					})
				},
				error => {
					this.setState({
						isLoaded	: false,
						error
					})
				}
			)
	}

	componentDidMount() {
		this.getPost();
	}

	componentDidUpdate(prevProps) {
		if(this.props.match.params.id !== prevProps.match.params.id) {
			this.setState({
				id : this.props.match.params.id
			});
		}
	}

	post() {
		const {error, isLoaded, entry} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {

			return (
					<div className="edit">
						{entry.title}
					</div>
			)
		}
	}

	render = () => <div>{this.post()}</div>
}