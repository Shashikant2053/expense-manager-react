import React, { Component } from "react";

import ExpenseTable from "./ExpenseTable.js";
import AddExpensePopup from "./AddExpensePopup";
import Cards from "./Cards";
import GenerateExcel from "./GenerateExcel";
import Loader from "./../Common/Loader";

import * as analytics from "./../../analytics/analytics";

class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = { showPopup: false, convertedCurrency: null };
    }

    togglePopup() {
        this.setState({
            showPopup: !this.state.showPopup
        });
    }

    componentDidMount() {
        analytics.initGA();
        analytics.logPageView();

        // if travel mode then convert currency else set to 1
        if (this.props.settings && this.props.settings.travelMode === "on") {
            function returnCur(cur) {
                switch (cur) {
                    case "Indian Rupees":
                        return "INR";
                    case "US Dollars":
                        return "USD";
                    case "Pounds":
                        return "EUR";
                    case "Euro":
                        return "EUR";
                    case "Yen":
                        return "YER";
                    default:
                        return "INR";
                }
            }

            let fromcur = returnCur(this.props.settings.fromCurrency);
            let tocur = returnCur(this.props.settings.currency);

            fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${fromcur}_${tocur}&compact=y`)
                .then(resp => resp.json()) // Transform the data into json
                .then(data => {
                    this.setState({ convertedCurrency: Object.values(data)[0].val });
                })
                .catch(() => {
                    alert("Some Problem with the currency converter api. Values will Fallback to default currency");
                    this.setState({ convertedCurrency: 1 });
                });
        } else {
            this.setState({ convertedCurrency: 1 });
        }
    }

    render() {
        const styleFromSettings = {
            fontFamily: this.props.settings ? this.props.settings.font : "sans-serif",
            backgroundColor: this.props.settings
                ? this.props.settings.mode === "night"
                    ? "#484842"
                    : "#EDF0EF"
                : "#EDF0EF",
            minHeight: "91vh"
        };

        if (this.props.settings) {
            console.log("converted currency : ", this.state.convertedCurrency);

            return (
                <div>
                    <div className="col-sm-12 mobileNoPadding" style={styleFromSettings}>
                        <Cards
                            expenses={this.props.expenses}
                            authUser={this.props.user}
                            settings={this.props.settings}
                        />
                        <GenerateExcel
                            expenses={this.props.expenses}
                            authUser={this.props.user}
                            settings={this.props.settings}
                        />
                        {this.state.convertedCurrency ? (
                            <ExpenseTable
                                expenses={this.props.expenses}
                                authUser={this.props.user}
                                settings={this.props.settings}
                                convertedCurrency={this.state.convertedCurrency}
                            />
                        ) : (
                            <Loader />
                        )}
                    </div>
                    <button className="addexpense-btn" onClick={this.togglePopup.bind(this)} id="addExpense">
                        <i className="fa fa-plus-circle fa-5x" aria-hidden="true" />
                    </button>
                    {this.state.showPopup ? (
                        this.state.convertedCurrency ? (
                            <AddExpensePopup
                                user={this.props.user}
                                closePopup={this.togglePopup.bind(this)}
                                settings={this.props.settings}
                                convertedCurrency={this.state.convertedCurrency}
                            />
                        ) : (
                            <Loader />
                        )
                    ) : null}
                </div>
            );
        } else {
            return (
                <div>
                    <Loader />
                </div>
            );
        }
    }
}

export default HomePage;
