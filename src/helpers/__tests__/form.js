import React from 'react';
import { getlistItemDisplay, selectOptionsSequenceFactory } from '../form';


test('List Item Display Should Match', () => {
	const	key 	= 1,
			name	= "test",
			handler	= "hello",
			obj 	= getlistItemDisplay(key, name, handler);

	expect(obj).toEqual(<li key={key}>
		{name}
		<span className="close" data-name={name} onClick={handler}>x</span>
	</li>
	);
  });

  test('List Item Display Should NOT Match', () => {
	const 	key 	= 1,
			name	= "test",
			handler	= "hello",
			obj 	= getlistItemDisplay(key, name, handler);

	expect(obj).not.toEqual(<li key={2}>
		test2
		<span className="close" data-name="test2" onClick="hello2">x</span>
	</li>
	);
  });

  test('Select Item Years', () => {
	  const x		= 1,
	  		obj		= selectOptionsSequenceFactory(1),
  			option	= [<option value={x} key={x}>{x.toString().padStart(2, '0')}</option>];

		expect(obj).toEqual(option);
  })