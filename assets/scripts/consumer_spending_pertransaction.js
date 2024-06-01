document.addEventListener('DOMContentLoaded', function () {
    fetch('assets/json/consumer_spending_pertransaction.json')
        .then(response => response.json())
        .then(data => {
            const revenues = data.map(item => parseFloat(item.Revenue));
            const totalTransactions = data.map(item => parseInt(item.Total_Transaksi));

            const ctxBar = document.getElementById('verticalBarChart').getContext('2d');
            const barChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: revenues,
                    datasets: [{
                        label: 'Total Transactions',
                        data: totalTransactions,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Consumer Spending per Transaction',
                            font: {
                                size: 20
                            }
                            ,
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
        });
});
