document.addEventListener('DOMContentLoaded', function () {
    fetch('assets/json/rawData.json')
        .then(response => response.json())
        .then(data => {
            // Mengelompokkan data berdasarkan Month dan menghitung total quantity
            const monthQuantityMap = new Map();
            data.forEach(item => {
                const month = new Date(item.TransDate).getMonth() + 1; // Extract month from TransDate
                const quantity = parseInt(item.RQty);
                if (monthQuantityMap.has(month)) {
                    monthQuantityMap.set(month, monthQuantityMap.get(month) + quantity);
                } else {
                    monthQuantityMap.set(month, quantity);
                }
            });

            // Memisahkan hasil map menjadi dua array untuk chart
            const labels = Array.from(monthQuantityMap.keys()).sort((a, b) => a - b); // Sort by month
            const quantities = labels.map(month => monthQuantityMap.get(month));

            const ctxBar = document.getElementById('horizontalBarChart').getContext('2d');
            const barChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: labels.map(month => new Date(0, month - 1).toLocaleString('en', { month: 'long' })),
                    datasets: [{
                        label: 'Total Quantity Sold',
                        data: quantities,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y', // Horizontal bar chart
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Quantity Sold by Month',
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
                                text: 'Total Quantity'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Month'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
