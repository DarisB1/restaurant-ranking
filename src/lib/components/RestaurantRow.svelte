<script>
	let { text, isChoose = true, onclick } = $props();
</script>

<button {onclick} class={isChoose ? 'choose' : ''}>{text}</button>

<style>
	button {
		border-radius: 9999px;
		border: 1px solid #e4e5de;
		padding: 4px 12px;
        cursor: pointer;
	}

	.choose {
		background-color: green;
		color: white;
		border: none;
	}
</style>
