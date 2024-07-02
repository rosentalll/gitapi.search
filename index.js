const body = document.querySelector("body");

const searchContainer = document.createElement("div");
searchContainer.classList.add("search");

const input = document.createElement("input");
input.classList.add("input");

const dropdown = document.createElement("div");
dropdown.classList.add("search__dropdown");

const repoCard = document.createElement("div");
repoCard.classList.add("repo-card");

searchContainer.appendChild(input);
searchContainer.appendChild(dropdown);
searchContainer.appendChild(repoCard);

body.appendChild(searchContainer);

const debouncedGetRepos = debounce(getRepos, 500);

input.addEventListener("input", () => {
    const inputValue = input.value.trim();

    if (!input.value[0]) {
        clearDropdown();
        return;
    }

    debouncedGetRepos(inputValue);
});

function debounce(callback, delay = 1000) {
    let timerId; 
    return (...args) => {
        clearTimeout(timerId)
        timerId = setTimeout(() => {
            callback(...args)
        }, delay)
    }
}

async function getRepos(request) {
    try {
        if (!request.trim()) {
            clearDropdown();
            return;
        }
        const response = await fetch(
            `https://api.github.com/search/repositories?q=${request}`,
            {
                headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        const repos = await response.json();
        const dropdownRepos = repos.items.slice(0, 5);

        dropdown.innerHTML = "";
        if (dropdownRepos.length) {
            renderCard(dropdownRepos)
        } else {
            dropdown.innerHTML = '<p class="no-results">No results...</p>';
        }
    } catch (error) {
        dropdown.innerHTML = `
            <p class="error-message">
            Error fetching data: ${error.message}
            </p>
        `;
        console.error("Error during fetch:", error.message);
    }
};

function createCard(data) {
    const newCard = document.createElement("div");
    newCard.classList.add("repo-card__content");
    newCard.innerHTML = `
        Name: ${data.name}
        <br>
        Owner: ${data.owner.login}
        <br>
        Stars: ${data.stargazers_count}
        <button class="btn-close"></button>
    `;
    repoCard.appendChild(newCard);

    const closeBtn = newCard.querySelector(".btn-close")
    closeBtn.addEventListener("click", () => {
        newCard.remove();
    });
};

function renderCard(data) {
    data.forEach((repo) => {
        const choice = document.createElement("p");
        choice.className = "search__choice";
        choice.textContent = `${repo.name}`;
        choice.addEventListener("click", () => {
            createCard(repo)
            input.value = " ";;
            clearDropdown();
        });
        dropdown.append(choice);
    });
}

function clearDropdown() {
    dropdown.innerHTML = "";
}

