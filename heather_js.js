// ALL GOOD
// Function to populate the state dropdown
function populateStateDropdown() {
    d3.json("data/filtered_years_clean.json")
        .then(data => {
            
            // Extract unique states
            const uniqueStates = [...new Set(data.map(item => item.state))];
            const dropdown = d3.select("#state-dropdown");
            dropdown.selectAll("option").remove(); // Clear existing options

            // Default option "All"
            dropdown.append("option").text("All").property("value", "all");

            // Append unique states to dropdown
            uniqueStates.forEach(state => {
                dropdown.append("option").text(state).property("value", state);
            });
        })
        .catch(error => {
            console.error("Error loading or processing data:", error);
        });
}

// ALL GOOD
// Function to populate the timeframe dropdown
function populateTimeframeDropdown() {
    const dropdown = d3.select("#selTimeframe");
    dropdown.selectAll("option").remove(); // Clear existing options
    dropdown.append("option").text("All").property("value", "all");
    dropdown.append("option").text("Custom").property("value", "custom");
}

// ALL GOOD
// Function to display custom date inputs
function toggleCustomDateInputs() {
    const timeframe = d3.select("#selTimeframe").property("value");
    const customTimeframeDiv = d3.select("#customTimeframe");

    if (timeframe === "custom") {
        customTimeframeDiv.style("display", "block");
    } else {
        customTimeframeDiv.style("display", "none");
    }
}

// ALL GOOD
// Function to filter the data based on dropdown inputs
function filterData() {
    return d3.json("data/filtered_years_clean.json")
        .then(data => {
            const timeframe = d3.select("#selTimeframe").property("value");
            const state = d3.select("#state-dropdown").property("value");

            let filteredData = data;

            // Timeframe filter (custom month/year range)
            if (timeframe === "custom") {
                const startDate = d3.select("#startDate").property("value");
                const endDate = d3.select("#endDate").property("value");

                if (startDate && endDate) {
                    const [startYear, startMonth] = startDate.split("-");
                    const [endYear, endMonth] = endDate.split("-");

                    filteredData = filteredData.filter(d => {
                        const reportYear = d.year;
                        const reportMonth = d.month;

                        return (
                            (reportYear > startYear || (reportYear === startYear && reportMonth >= startMonth)) &&
                            (reportYear < endYear || (reportYear === endYear && reportMonth <= endMonth))
                        );
                    });
                }
            }

            // State filter
            if (state && state !== "all") {
                filteredData = filteredData.filter(d => d.state === state);
            }

            return filteredData;
        })
        .catch(error => {
            console.error("Error loading or processing data:", error);
            return []; // Return an empty array in case of error
        });
}

// ALL GOOD
// Function to update the dashboard with class counts
function updateDashboard() {
    filterData().then(filteredData => {

        // Update overall sightings count
        const totalSightings = filteredData.length;
        d3.select("#total-sightings-count").text(`Total Sightings: ${totalSightings}`);

        // Calculate and display the count for each class (A, B, C)
        const classCounts = { A: 0, B: 0, C: 0 };  // Initialize class counts

        filteredData.forEach(item => {
            if (item.report_class === "A") {
                classCounts.A++;
            } else if (item.report_class === "B") {
                classCounts.B++;
            } else if (item.report_class === "C") {
                classCounts.C++;
            }
        });

        const classList = d3.select("#class-counts");
        classList.selectAll("*").remove();  // Clear previous counts
        classList.append("li").text(`Class A: ${classCounts.A}`);
        classList.append("li").text(`Class B: ${classCounts.B}`);
        classList.append("li").text(`Class C: ${classCounts.C}`);

        const tableBody = d3.select('#data-table tbody');
        tableBody.selectAll("tr").remove();

        filteredData.forEach(d => {
            const row = tableBody.append("tr");
    
            row.append("td").text(d.report_number);
            row.append("td").text(d.report_class);
            row.append("td").text(d.year);
            row.append("td").text(d.season);
            row.append("td").text(d.month);
            row.append("td").text(d.state);
            row.append("td").text(d.county);
            row.append("td").text(d.location_details);
        });

        // Calculate season counts
            const seasonCounts = filteredData.reduce((acc, item) => {
            const season = item.season;
            if (!acc[season]) {
                acc[season] = 0;
            }
            acc[season]++;
            return acc;
        }, {});

        // Create the bar chart
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Clear previous chart
        d3.select("#season-bar-chart").html(""); 

        const svg = d3.select("#season-bar-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const seasons = Object.keys(seasonCounts);
        const counts = Object.values(seasonCounts);

        const x = d3.scaleBand()
            .domain(seasons)
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(counts)])
            .nice()
            .range([height, 0]);

        svg.selectAll(".bar")
            .data(counts)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => x(seasons[i]))
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d))
            .attr("fill", "#4CAF50");

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Optional: Add axis labels
        svg.select(".x-axis")
            .selectAll("text")
            .style("text-anchor", "middle");

        svg.select(".y-axis")
            .append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .text("Count");
    });
};

// ALL GOOD
// Function to set default values for the dropdowns when the page loads
function setDefaultDropdowns() {
    // Set "All" as default for both state and timeframe
    d3.select("#selTimeframe").property("value", "all");
    d3.select("#state-dropdown").property("value", "all");

    // Call updateDashboard to display the counts with the default "All" selections
    updateDashboard();
}

// Call the setDefaultDropdowns function on page load to set "All" as default
window.onload = setDefaultDropdowns;

// Event listener for the timeframe dropdown (change event)
d3.select("#selTimeframe").on("change", () => {
    toggleCustomDateInputs(); // Toggle visibility of custom date inputs
    updateDashboard(); // Update the dashboard when the timeframe changes
});

// Event listeners for the start date, end date, and state 
d3.select("#startDate").on("change", updateDashboard);
d3.select("#endDate").on("change", updateDashboard);
d3.select("#state-dropdown").on("change", updateDashboard);

// Call functions to populate dropdowns when the page loads
populateStateDropdown();
populateTimeframeDropdown();
    