import React from "react";
import axios from "axios";

interface State {
    mainLabel: string
}

interface Props {
    incoming: string
}

class Testing extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            mainLabel: 'Test'
        }
    }


    buttonClick = async () => {
        console.log("Hello")
        await axios.get(
            "https://r4bj3dj56e.execute-api.us-east-1.amazonaws.com/prod/testing",
            {params: {testParam: "hello"}})
            .then( (response) => {
                this.setState({mainLabel: response.data})
            })
    }

    render() {
        return(
            <div>
                <p>
                    {this.state.mainLabel}
                    <button onClick={this.buttonClick}>
                        Click
                    </button>
                    {this.props.incoming}
                </p>
            </div>
        )
    }
}

export default Testing