<script>
	let { text, nombre, isChoose = true, click } = $props();
</script>

<button onclick={click} class={isChoose ? 'choose' : ''}>{text}<span>{nombre}</span></button>

<style>
	button {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #9A9D95;
		font-weight: 500;
		font-size: 15px;
		text-align: center;
        padding: 10px;
        border: none;
        background-color: #FAFAF7;
        cursor: pointer;
	}

    .choose {
        color: black;
        border-bottom: 2px solid black;
    }
    
    span {
        color: #9A9D95;
    }
</style>
