import React from "react";

const getlistItemDisplay = (key, name, handler) =>
		<li key={key}>
			{name}
			<span className="close" data-name={name} onClick={handler}>x</span>
		</li>

export {getlistItemDisplay}