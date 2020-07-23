import React from "react";

const	getlistItemDisplay = (key, name, handler) =>
			<li key={key}>
				{name}
				<span className="close" data-name={name} onClick={handler}>x</span>
			</li>,

		selectOptionsSequenceFactory	=	end	=> {
												let options = [];

												for(let x = 1; x < end+1; x++) {
													options.push(<option value={x} key={x}>{x.toString().padStart(2, '0')}</option>);
												}

												return options;

		},
		d					= new Date(),
		getSelectDateOptions	=	{
			years	:	() => selectOptionsSequenceFactory(d.getFullYear()),
			months	:	() => selectOptionsSequenceFactory(12),
			days	: 	() => selectOptionsSequenceFactory(31),
			hours	:	() => selectOptionsSequenceFactory(24),
			minutes	:	() => selectOptionsSequenceFactory(60),
		}

export {getlistItemDisplay, getSelectDateOptions, selectOptionsSequenceFactory }