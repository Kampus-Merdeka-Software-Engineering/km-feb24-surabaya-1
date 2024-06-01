document.addEventListener('DOMContentLoaded', function () {
    fetch('assets/json/rawData.json')
        .then(response => response.json())
        .then(data => {
            // Mengelompokkan data berdasarkan Revenue
            const revenueMap = new Map();
            data.forEach(item => {
                const revenue = parseFloat(item.Revenue);
                if (revenueMap.has(revenue)) {
                    revenueMap.set(revenue, revenueMap.get(revenue) + 1);
                } else {
                    revenueMap.set(revenue, 1);
                }
            });

            // Memisahkan hasil map menjadi dua array untuk chart
            const revenues = Array.from(revenueMap.keys());
            const totalTransactions = Array.from(revenueMap.values());

            const ctxLine = document.getElementById('myChart').getContext('2d');
            const lineChart = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: revenues,
                    datasets: [{
                        label: 'Total Transactions',
                        data: totalTransactions,
                        backgroundColor: 'rgba(0, 0, 255, 0.2)', // Warna biru dengan transparansi
                        borderColor: 'rgba(0, 0, 255, 1)', // Warna biru
                        borderWidth: 1,
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Transaction Per Revenue',
                            font: {
                                size: 20
                            },
                            color: 'black'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Revenue'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Total Transactions'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
