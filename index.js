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

input.addEventListener("input", (e) => {
    const inputValue = e.target.value.trim();

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
            `https://api.github.com/search/repositories?q=${request}&per_page=5`,
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
        const dropdownRepos = repos.items;
        clearDropdown()

        if (dropdownRepos.length) {
            renderCard(dropdownRepos)
        } else {
            addTextTo(dropdown, 'No results...')
        }
    } catch (error) {
        addTextTo(dropdown, `Error fetching data: ${error.message}`)
        console.error("Error during fetch:", error.message);
    }
};

function createCard(data) {
    const newCard = document.createElement("div");
    newCard.classList.add("repo-card__content");

    const newCardInfo = document.createElement("div");
    newCardInfo.classList.add("repo-card__info");
    newCard.append(newCardInfo);

    const info = [
        `Name: ${data.name}`, 
        `Owner: ${data.owner.login}`, 
        `Stars: ${data.stargazers_count}`
    ]
    
    for (let i = 0; i < info.length; i++) {
        addTextTo(newCardInfo, info[i], 'repo-card__info-line')
    }

    const closeBtn = document.createElement('button')
    closeBtn.classList.add("btn-close")
    newCard.append(closeBtn)

    repoCard.appendChild(newCard);

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

function addTextTo(element, text, someClass = null) {
    const paragraph = document.createElement('p')
    if (someClass !== null) paragraph.classList.add(someClass)
    paragraph.textContent = text
    element.append(paragraph)
}

function clearDropdown() {
    let choices = Array.from(dropdown.children)
    choices.forEach(choice => choice.remove())
}


