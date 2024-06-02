document.addEventListener("DOMContentLoaded", function() {
    fetch('assets/json/rawData.json')
        .then(response => response.json())
        .then(rawData => {
            // Proses data untuk mendapatkan total_revenue per location dan category
            const dataMap = new Map();

            rawData.forEach(item => {
                const location = item.Location;
                const category = item.Category;
                const revenue = parseFloat(item.Revenue);

                if (!dataMap.has(location)) {
                    dataMap.set(location, new Map());
                }

                if (!dataMap.get(location).has(category)) {
                    dataMap.get(location).set(category, 0);
                }

                const currentRevenue = dataMap.get(location).get(category);
                dataMap.get(location).set(category, currentRevenue + revenue);
            });

            // Buat array untuk lokasi dan kategori
            const locations = Array.from(dataMap.keys());
            const categories = Array.from(new Set(rawData.map(item => item.Category)));

            // Soft colors array
            const softColors = [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ];

            // Buat datasets untuk Chart.js
            const datasets = categories.map((category, index) => {
                return {
                    label: category,
                    data: locations.map(location => {
                        return dataMap.get(location).get(category) || 0;
                    }),
                    backgroundColor: softColors[index % softColors.length],
                };
            });

            // Render chart menggunakan Chart.js
            const ctx = document.getElementById('revenueBarChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: locations,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Revenue per Location and Category',
                            font: {
                                size: 20
                            },
                            color: 'black'
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        });
});