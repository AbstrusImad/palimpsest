from gltest import get_contract_factory, create_account
from gltest.assertions import tx_execution_succeeded

RULINGS = ("CANONIZE", "APOCRYPHA", "REJECT")


def test_canon_consensus():
    factory = get_contract_factory("Palimpsest")
    contract = factory.deploy(args=[])

    # The first entry into an empty world: it cannot contradict anything, so a
    # coherent piece of lore should be canonized. This is the AI consensus write.
    scribe = create_account()
    rc = contract.connect(scribe).scribe(
        args=[
            "Vael, the First Cartographer",
            "FIGURE",
            "Vael charted the drowned coasts before the Sundering and is said to have drawn the first true map of the inner sea, a map later lost in the burning of the Tidehall.",
            "",
        ]
    ).transact()
    assert tx_execution_succeeded(rc)

    stats = contract.get_stats(args=[]).call()
    assert int(stats["entries"]) == 1
    assert int(stats["canon"]) == 1

    listing = contract.get_entries(args=[0]).call()
    assert len(listing) == 1
    eid = listing[0]["id"]
    assert listing[0]["status"] == "CANON"
    assert listing[0]["kind"] == "FIGURE"

    full = contract.get_entry(args=[eid]).call()
    assert full["title"] == "Vael, the First Cartographer"
    assert len(full["body"]) > 20

    log = contract.get_chronicle(args=[0]).call()
    assert len(log) == 1
    assert log[0]["ruling"] in RULINGS

    # A second entry that references and builds on the first should be ruled.
    scribe2 = create_account()
    rc2 = contract.connect(scribe2).scribe(
        args=[
            "The Tidehall",
            "PLACE",
            "The Tidehall was the great archive of the inner sea, where Vael's maps were kept until fire took it during the Sundering.",
            "Vael, the First Cartographer",
        ]
    ).transact()
    assert tx_execution_succeeded(rc2)

    stats2 = contract.get_stats(args=[]).call()
    assert int(stats2["submissions"]) == 2
