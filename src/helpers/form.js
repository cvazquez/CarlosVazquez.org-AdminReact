import React from "react";

const	getlistItemDisplay = (key, name, handler) =>
			<li key={key}>
				{name}
				<span className="close" data-name={name} onClick={handler}>x</span>
			</li>,

		selectOptionsSequenceFactory	=	(start, end, order="+")	=> {
												let options = [];

												// Increments or decrements the loop, depending on order, and returns select options
												for(let x = start; x > 0;) {
													options.push(<option value={x} key={x}>{x.toString().padStart(2, '0')}</option>);

													if(order === "+") {
														if(x < end) {
															x++;
														} else {
															break;
														}
													} else {
														if(x > end) {
															x--;
														} else {
															break;
														}
													}
												}

												return options;
		},
		getSelectDateOptions	=	{
			years	:	() => {
								const d = new Date();
								return selectOptionsSequenceFactory(d.getFullYear(), 2005, "-");
			},
			months	:	() => selectOptionsSequenceFactory(1, 12),
			days	: 	() => selectOptionsSequenceFactory(1, 31),
			hours	:	() => selectOptionsSequenceFactory(1, 24),
			minutes	:	() => selectOptionsSequenceFactory(1, 60),
		}

export {getlistItemDisplay, getSelectDateOptions, selectOptionsSequenceFactory }