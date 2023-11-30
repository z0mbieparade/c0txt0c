//this is the javascript version of this class, no jquery!
//settings replace <div id="key" />
class Settings
{
	constructor(settings, options)
	{
		this.options = {...{
			app_name: '',
			local_storage: true
		}, ...options};
		this.settings = settings;

		this.update_settings_timer = null;
		this.skip_input = ['layer', 'obj'];

		/*
		var settings =
		{
			checkbox: {
				label: 'Checkbox',
				type: 'bool',
				default: true,
				skip_random: true //leave out of rand_settings
			},
			number: {
				label: 'Number',
				type: 'int',
				default: 0,
				min: 0,
				max: 100
			},
			dropdown: {
				label: 'Dropdown',
				type: 'enum',
				values: [
					{val: 'val1', txt: 'Value 1'},
					{val: 'val2', txt: 'Value 2'},
					{val: 'val3', txt: 'Value 3'},
				],
				default: 'val1',
				on_change: (val) => {}
			},
			switch: {
				type: 'bool',
				ui_type: 'switch',
				ui_subtype: 'inside_label',
				default: false
			}
			object: {
				type: 'obj',
				default: [], {}, etc.,
				on_change: (val) => {}
			}
			layer_0: {
				type: 'layer',
				default: 
				{
					id: 0,
					label: 'Layer 0',
					order: 0,
					visible: true,
					selected: false,
					data: {
						y: {
							x: {
								f: null,
								b: null,
								char: null
							}
						}
					},
				}
			}
		};
		*/

		if(this.options.local_storage)
		{
			let settings_key = 'settings';
			if(this.options.app_name) settings_key = this.options.app_name + '_settings';
			let local_settings = localStorage.getItem(settings_key);

			if(local_settings)
			{
				try {
					this.local_settings = JSON.parse(local_settings);
				}
				catch(e)
				{
					this.local_settings = false;
				}
			}
		}
	}

	update_settings()
	{
		if(this.options.local_storage)
		{
			clearTimeout(this.update_settings_timer);
			this.update_settings_timer = setTimeout(() =>
			{
				let settings_key = 'settings';
				if(this.options.app_name) settings_key = this.options.app_name + '_settings';
				let vals = this.get_settings();
				this.local_settings = vals;
				localStorage.setItem(settings_key, JSON.stringify(vals));
			}, 1000);
		}
	}

	//call on document ready
	build_settings(override_settings)
	{
		for(let key in this.settings)
		{
			this.add(key, false, false, (override_settings && override_settings[key] ? override_settings[key] : undefined));
		}

		for(let key in this.settings)
		{
			let field_elem = document.querySelector('#' + key);
			if(field_elem && this.settings[key].on_change) field_elem.dispatchEvent(new Event('change'));
		}

		this.update_settings();
	}

	reset_to_default()
	{
		if(this.options.local_storage)
		{
			let settings_key = 'settings';
			if(this.options.app_name) settings_key = this.options.app_name + '_settings';
			localStorage.removeItem(settings_key);
		}

		for(let key in this.settings)
		{
			this.settings[key].value = this.settings[key].default;
			let field_elem = document.querySelector('#' + key);
			if(this.settings[key].on_change && field_elem) field_elem.dispatchEvent(new Event('change'));
		}
	}

	add(key, fire_change, update_set, setting)
	{
		if(this.settings[key] === undefined)
		{
			this.settings[key] = setting;
		}

		if(this.local_settings && this.local_settings[key] !== undefined)
		{
			this.settings[key].value = setting !== undefined && setting.value !== undefined ? setting.value : this.local_settings[key];
		}
		else
		{
			this.settings[key].value = setting !== undefined && setting.value !== undefined ? setting.value : this.settings[key].default;
		}

		let input_div = document.querySelector('#' + key);

		if(input_div && !this.skip_input.includes(this.settings[key].type))
		{

			let label_elem = document.createElement('label');
			let set_elem;

			if(this.settings[key].type === 'enum')
			{
				label_elem.innerText = this.settings[key].label + ':';
				label_elem.setAttribute('for', key);

				set_elem = document.createElement('select');
				set_elem.setAttribute('id', key);

				if(this.settings[key].values && this.settings[key].values.length)
				{
					for(let i = 0; i < this.settings[key].values.length; i++)
					{
						let option_elem = document.createElement('option');
						option_elem.setAttribute('value', this.settings[key].values[i].val);
						option_elem.innerText = this.settings[key].values[i].txt;

						set_elem.appendChild(option_elem);
					}
				}

				set_elem.value = this.settings[key].value;
			}
			else
			{
				set_elem = document.createElement('input');
				set_elem.setAttribute('id', key);

				label_elem.setAttribute('for', key);

				if(this.settings[key].label) label_elem.innerText = this.settings[key].label + ':';

				if(this.settings[key].type === 'int')
				{
					set_elem.setAttribute('type', 'number');
					if(this.settings[key].min !== undefined) set_elem.setAttribute('min', this.settings[key].min);
					if(this.settings[key].max !== undefined) set_elem.setAttribute('max', this.settings[key].max);

					set_elem.value = this.settings[key].value;
				}
				else if(this.settings[key].type === 'bool')
				{
					set_elem.setAttribute('type', 'checkbox');
					set_elem.checked = this.settings[key].value;

					if(this.settings[key].ui_type === 'switch')
					{
						label_elem.setAttribute('id', key + '_switch');
						label_elem.classList.add('switch');

						this.settings[key].add_after = '<span class="slider"></span>';
						if(this.settings[key].ui_subtype) label_elem.classList.add(this.settings[key].ui_subtype);
					}
				}
			}

			this.settings[key].set_value = (new_value, fire_change) =>
			{
				if(this.settings[key].type === 'bool')
				{
					set_elem.checked = new_value;
				}
				else 
				{
					set_elem.value = new_value;
				}
				this.settings[key].value = new_value;

				if(this.settings[key].on_change && fire_change !== false) this.settings[key].on_change(new_value);
				this.update_settings();
			}

			set_elem.addEventListener('change', () => 
			{
				if(this.settings[key].type === 'bool')
				{
					val = set_elem.checked;
				}
				this.settings[key].value = set_elem.value;

				if(this.settings[key].on_change) this.settings[key].on_change(set_elem.value);
				this.update_settings();
			});

			label_elem.appendChild(set_elem);
			if(this.settings[key].add_after) label_elem.appendChild(this.settings[key].add_after);
			input_div.replaceWith(label_elem);

			if(this.settings[key].on_change && fire_change !== false)
			{
				let field_elem = document.querySelector('#' + key);
				if(field_elem) field_elem.dispatchEvent(new Event('change'));
			}
		}
		else 
		{
			this.settings[key].set_value = (new_value, fire_change) =>
			{
				this.settings[key].value = new_value;
				if(this.settings[key].on_change && fire_change !== false) this.settings[key].on_change(new_value);
				this.update_settings();
			}
		}

		if(update_set !== false) this.update_settings();
	}

	remove(key, update_set)
	{
		delete this.settings[key];
		if(this.local_settings) delete this.local_settings[key]
		if(update_set !== false) this.update_settings();
	}

	enable(field)
	{
		let field_elem = document.querySelector('#' + field);
		field_elem.removeAttribute('disabled');
		let field_parent = field_elem.parentNode;
		field_parent.removeAttribute('disabled');
		this.settings[field].disable = false;
	}

	disable(field)
	{
		let field_elem = document.querySelector('#' + field);
		field_elem.setAttribute('disabled','disabled');
		let field_parent = field_elem.parentNode;
		field_parent.setAttribute('disabled','disabled');
		this.settings[field].disable = true;
	}

	get_settings(override)
	{
		let vals = {};
		for(let key in this.settings)
		{
			vals[key] = this.settings[key].value;
		}

		return {...vals, ...override};
	}
}
