<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<template>
    <header>
        <Navbar />
    </header>
    <main>
        <router-view />
    </main>
    <!-- <footer class="items-center p-4 footer bg-neutral text-neutral-content">
        <div class="items-center grid-flow-col">
            <p>Copyright © 2022 - AlgoFractals NFT</p>
        </div>
    </footer> -->
</template>
