<template>
    <div class="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
        <div class="flex-1 px-2 mx-2">
            <span class="text-lg text-yellow-300 font-bold">
                AlgoFractals NFT v0.1.0
            </span>
        </div>
        <label for="my-modal-2" class="btn btn-accent modal-button"
            >About</label
        >
        <input type="checkbox" id="my-modal-2" class="modal-toggle" />
        <div class="modal">
            <div class="modal-box">
                <p class="text-xl text-bold text-center">
                    AlgoFractals NFT v0.1.0
                </p>
                <p class="text-sm">
                    <br /><br />
                    A random fractal generation tool that mints the resulting
                    image into an NFT on Algorand Blockchain.<br />
                    The resulting NFT is an ASA (Algorand Standard Asset) with 0
                    decimals in place and total supply of 1 unit.<br />
                    The platform additionally appends the RFC traits into
                    metadata field, platforms like NFTExplorer.io and
                    RandGallery.com render that metadata on their platforms.<br />
                    Fractal generation, font choise, and palletes are all
                    randomly generated on each page restart. In other words
                    every single AlgoFractals NFT is unique and minted on behalf
                    of anyone creating via this platform. <br />Manager wallet
                    is set to the address of the user wallet. That way end user
                    is free to edit the ASA after minting in any way he wants
                    (issuing asset config transactions).

                    <br /><br />Currently only supports Mandelbrot sets. Stay
                    tuned for more randomization and new sets!
                </p>
                <br />
                <p class="text-xs italic">
                    AlgoFractals is not a trading platform, it simply wraps the
                    execution of create ASA transaction into a friendly user
                    interface. Once executed, randomly generated fractal
                    rendered in your browser will turn into an ASA and get into
                    your Algorand Wallet instantly. Creator of the platform
                    requires 0.5 Algos fee to be send for each mint as tips for
                    platform maintenance. Due your due diligince and purchase at
                    your own risk.
                </p>
                <br />

                <p class="text-center text-sm">
                    <a
                        href="https://twitter.com/algo_fractals"
                        class="text-center text-sm"
                        target="_blank"
                        >@algo_fractals</a
                    >
                    <br />
                    Copyright © 2022 - AlgoFractals NFT
                </p>
                <div class="modal-action">
                    <label for="my-modal-2" class="btn">OK</label>
                </div>
            </div>
        </div>
    </div>
</template>
