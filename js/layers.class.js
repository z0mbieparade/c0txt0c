class Layers
{
    constructor(grid, settings)
	{
        this.grid = grid;
        this.settings = settings;
        this.layers = [];

        this.layers_elem = document.querySelector('#grid #layers');
        this.panel_elem = document.getElementById('layer_panel');
        this.list_elem = document.getElementById('layers_list');

        this.add_button = document.getElementById('add_layer');
        this.add_button.addEventListener('click', (e) => 
        {
            this.sort();
            let selected_layer = this.selected_default;
            let new_layer_options = {};
            if(selected_layer) new_layer_options.order = selected_layer.options.order + 1;
            this.add_layer(new_layer_options);
        });
    
        this.delete_button = document.getElementById('delete_layer');
        this.delete_button.addEventListener('click', (e) => 
        {
            let selected_layer = this.selected;
            if(selected_layer) selected_layer.delete();
            this.sort();
        });
    }

    get selected()
    {
        if(this.layers.length === 0) return false;
        return this.layers.find(layer => layer.options.selected === true);
    }

    get selected_default()
    {
        if(this.layers.length === 0) return false;
        let selected_layer = this.layers.find(layer => layer.options.selected === true);
        if(!selected_layer) selected_layer = this.layers[this.layers.length - 1];
        return selected_layer;
    }

    get last_created()
    {
        if(this.layers.length === 0) return false;
        return this.layers.reduce((a, b) => a.options.id > b.options.id ? a : b);
    }

    //load layers from settings
    load()
    {
        this.layers = [];
        this.list_elem.innerHTML = '';

        console.log('local_settings:', this.settings.local_settings);

        for(let key in this.settings.local_settings)
        {
            if(key.match(/^layer_\d+$/))
            {
                console.log('add layer from local_settings:', key, this.settings.local_settings[key]);
                this.layers.push(new Layer(this, key, this.settings.local_settings[key], this.settings.local_settings[key].data));
            }
        }
        this.sort();

        if(this.layers.length === 0)
        {
            console.log('no layers, add empty');
            this.layers.push(new Layer(this));
        }
    }

    //layer order: 0, 10, 20, 30, etc. 0 = bottom layer.
    sort() 
    {
        this.layers = this.layers
            .sort((a, b) => a.options.order - b.options.order);

        this.layers.forEach((layer, i) => 
        {
            let prev_layer = this.layers[i - 1];
            if(!prev_layer)
            {
                this.layers[i].options.order = 0;
            }
            else 
            {
                this.layers[i].options.order = prev_layer.options.order + 10;
            }
        });

        //reorder list elem
        for(let i = this.layers.length - 1; i >= 0; i--)
        {
            let layer = this.layers[i];
            if(layer.elem)
            {
                this.list_elem.appendChild(layer.elem);
            }
        }
    }

    save()
    {
        this.layers.forEach((layer) => layer.save(false));
        this.settings.update_settings();
    }

    add_layer(options, data)
    {
        this.layers.push(new Layer(this, null, options, data));
        this.sort();
        this.save();
    }
}