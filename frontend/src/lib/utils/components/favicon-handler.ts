import React, { useEffect } from 'react'

const FaviconHandler = () => {
  useEffect(() => {
    // Function to change the favicon
    const changeFavicon = (faviconUrl: string) => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (link) {
        link.href = faviconUrl
      } else {
        const newLink = document.createElement('link')
        newLink.rel = 'icon'
        newLink.href = faviconUrl
        document.head.appendChild(newLink)
      }
    }

    // Function to handle the window focus event
    const handleFocus = () => {
      changeFavicon('/path-to-your-focused-favicon.ico') // Path to favicon when focused
    }

    // Function to handle the window blur event
    const handleBlur = () => {
      changeFavicon('/path-to-your-unfocused-favicon.ico') // Path to favicon when unfocused
    }

    // Add event listeners for focus and blur
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Set the initial favicon (focused state)
    changeFavicon('/path-to-your-focused-favicon.ico')

    // Cleanup the event listeners when the component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return null // This component doesn't render anything
}

export default FaviconHandler
