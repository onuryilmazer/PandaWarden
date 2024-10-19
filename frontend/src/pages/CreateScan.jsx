function CreateScan() {
    return (
        <>
            <a>&lt;- Go Back</a>
            <form>
                Topic: <input type="text" placeholder="NVIDIA, Amazon, Lithium mines, Military coup..."></input>
                <br />
                Repeated: <input type="checkbox"></input>
                <br />
                Alert type: 
                    <select>
                        <option>E-Mail</option>
                        <option disabled>SMS (Coming soon)</option>
                        <option disabled>Whatsapp message (Coming soon)</option>
                    </select>
                <br />
                Search regions:
                    <select>
                        <option>EMEA (Europe, the Middle East and Africa)</option>
                        <option>NA (North America)</option>
                        <option>LATAM (Latin America)</option>
                        <option>APAC (Asia-Pacific)</option>
                    </select>
                <br />
                Use local languages when searching non-english websites: <input type="checkbox"></input>
                <br />
                <button type="submit">Create scan</button>
            </form>
        </>
    )
}

export default CreateScan;