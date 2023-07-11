import React, { useState, useCallback } from "react"
import SearchField from "../../../front_end_library/@amzn/meridian/search-field"

const Searchbar = () => {
  const [query, setQuery] = useState("")
  const onSubmit = useCallback(query => console.log("submit:", query), [])
  return (
    <SearchField
      value={query}
      onChange={setQuery}
      placeholder="Search for..."
      onSubmit={onSubmit}
    />
  )
}

export default Searchbar;