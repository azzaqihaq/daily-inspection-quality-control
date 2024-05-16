import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from "@vitejs/plugin-react";
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css', 
                'resources/js/app.js',
                'resources/js/product_defect_detection/index.jsx',
                'resources/js/part_scanner_indicator/index.jsx'
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@trained_label': path.resolve(__dirname, 'public/trained_label/'),
            '@trained_model': path.resolve(__dirname, 'public/trained_model/'),
            '@css': path.resolve(__dirname, 'resources/css/')
        }
    }
});
