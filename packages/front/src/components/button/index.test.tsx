// import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { Button } from "@/components/ui/button"

describe.skip('Home', () => {
    it('renders a heading', () => {
        const { container } = render(<Button onClick={() => { }} >Ejemplo</Button>);

        expect(container.firstChild).toBeTruthy();

        expect(container).toHaveTextContent('Click me');

    })
})